export interface AIAnalysisResult {
    summary: string;
    suggestedCategories: string[];
}

export const aiService = {
    async waitForModel(response: Response): Promise<any> {
        const result = await response.json();
        if (result.error && result.error.includes('loading')) {
            // Wait for 5 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
            throw new Error('MODEL_LOADING');
        }
        return result;
    },

    async fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> {
        for (let i = 0; i < maxRetries; i++) {
            const response = await fetch(url, options);

            if (response.status === 503) {
                console.log(`Model is loading, attempt ${i + 1} of ${maxRetries}...`);
                // Wait for 5 seconds before retrying
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            return response;
        }
        throw new Error('Maximum retries reached, model still unavailable');
    },

    async analyzeNote(content: string, availableCategories: { id: string; name: string }[]): Promise<AIAnalysisResult> {
        if (!process.env.NEXT_PUBLIC_HUGGING_FACE_TOKEN) {
            throw new Error('Hugging Face API token is not configured');
        }

        try {
            const categoryNames = availableCategories.map(cat => cat.name).join(', ');
            console.log('Starting analysis with categories:', categoryNames);

            // First, get the summary using Hugging Face's summarization model
            const summaryResponse = await this.fetchWithRetry(
                "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_HUGGING_FACE_TOKEN}`
                    },
                    method: "POST",
                    body: JSON.stringify({
                        inputs: content,
                        parameters: {
                            max_length: 100,
                            min_length: 30,
                        },
                    }),
                }
            );

            if (!summaryResponse.ok) {
                throw new Error(`Summary API error: ${summaryResponse.status} ${summaryResponse.statusText}`);
            }

            const summaryResult = await this.waitForModel(summaryResponse);
            console.log('Summary response:', summaryResult);

            let summary = 'No summary available';
            if (Array.isArray(summaryResult) && summaryResult[0]?.summary_text) {
                summary = summaryResult[0].summary_text;
            } else if (summaryResult?.summary_text) {
                summary = summaryResult.summary_text;
            }

            // Then, get category suggestions using a zero-shot classification model
            const classificationResponse = await this.fetchWithRetry(
                "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_HUGGING_FACE_TOKEN}`
                    },
                    method: "POST",
                    body: JSON.stringify({
                        inputs: content,
                        parameters: {
                            candidate_labels: categoryNames.split(", ")
                        },
                    }),
                }
            );

            if (!classificationResponse.ok) {
                throw new Error(`Classification API error: ${classificationResponse.status} ${classificationResponse.statusText}`);
            }

            const classificationResult = await this.waitForModel(classificationResponse);
            console.log('Classification response:', classificationResult);

            let suggestedCategories: string[] = [];

            if (classificationResult?.labels && classificationResult?.scores) {
                // Get categories with confidence score > 0.3 (lowered threshold for better suggestions)
                const suggestedCategoryNames = classificationResult.labels
                    .filter((_: string, index: number) => classificationResult.scores[index] > 0.3);

                // Map category names back to IDs
                suggestedCategories = suggestedCategoryNames
                    .map((name: string) => availableCategories.find(cat =>
                        cat.name.toLowerCase() === name.toLowerCase()
                    )?.id)
                    .filter((id: string | undefined): id is string => id !== undefined);
            }

            return {
                summary,
                suggestedCategories
            };
        } catch (error) {
            console.error('AI analysis failed:', error);
            if (error instanceof Error && error.message === 'MODEL_LOADING') {
                throw new Error('The AI model is still loading. Please try again in a few seconds.');
            }
            throw new Error(error instanceof Error ? error.message : 'Failed to analyze note with AI');
        }
    }
}; 