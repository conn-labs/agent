import { prisma } from "../../lib";

import { TodoistApi } from "@doist/todoist-api-typescript";

export async function getTodoistData(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) return null;
  const token = user.todoist?.accessToken;
  if (!token) return null;
  const client = new TodoistApi(token);
  const projects = await client.getProjects();
  const data = await Promise.all(
    projects.map(async (project) => {
      const tasks = await client.getTasks({ projectId: project.id });
      const sections = await client.getSections(project.id);
      const tasksWithComments = await Promise.all(
        tasks.map(async (task) => {
          const comments = await client.getComments({ taskId: task.id });
          const commentsString = comments
            .map(
              (t) =>
                `Content ${t.content} Id: ${t.id} Posted At: ${t.postedAt}`
            )
            .join("\n");
          return `Content: ${task.content} Id: ${task.id} Completed: ${
            task.isCompleted
          } description: ${task.description} Due: ${
            task.due?.datetime
          } Labels: ${task.labels.toString()} Task Comments: ${commentsString}`;
        })
      );
      return `Project Name: ${project.name} ProjectId: ${project.id} \nProject Sections: ${sections
        .map((s) => `Name: ${s.name} Id: ${s.id} Order Position: ${s.order}`)
        .join("\n")} Tasks: ${tasksWithComments.join("\n")}`;
    })
  );
  return data;
}


