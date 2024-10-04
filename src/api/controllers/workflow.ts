import { Request, Response } from "express";
import { WorkflowJobSchema } from "../../types/workflow";
import {z} from "zod"
export const createWorkflowJob = async (req: Request, res: Response) => {
    try {
        const parsedData = WorkflowJobSchema.parse(req.body);
        
        
    } catch (error) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
             res.status(400).json({
                error: "Validation failed",
                issues: error.errors // Return detailed validation errors
            });
            return;
        }
        
        console.error(error);
         res.status(500).json({ error: "Internal server error." });
         return;
    }
};
