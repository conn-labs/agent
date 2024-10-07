

export interface FormattedPrompt {
    objective: string
    plan: [{
        id: number,
        description: string
    }],
    thought: string
}