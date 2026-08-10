export type AIProviderAdapter = {
  /**
   * Starts an asynchronous AI generation job.
   * @param modelSlug The model to use (e.g., 'replicate/flux-1-schnell')
   * @param prompt The prompt to generate
   * @param settings Additional settings like negative_prompt, aspect_ratio, etc.
   * @param apiKey Optional BYOK API key. If not provided, the platform default key is used.
   * @returns An object containing the providerJobId which can be used to poll status.
   */
  startGeneration(
    modelSlug: string,
    prompt: string,
    settings: any,
    apiKey?: string
  ): Promise<{ providerJobId: string }>;

  /**
   * Checks the status of an ongoing generation job.
   * @param providerJobId The job ID returned from startGeneration
   * @param apiKey Optional BYOK API key
   * @returns The current status and, if succeeded, the outputUrl.
   */
  checkStatus(
    providerJobId: string,
    apiKey?: string
  ): Promise<{
    status: "pending" | "processing" | "succeeded" | "failed";
    outputUrl?: string;
    errorMessage?: string;
  }>;
}
