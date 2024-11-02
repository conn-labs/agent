import axios from "axios";
import { prisma } from "../../lib";

async function getAllNetlifyData(email: string): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user || !user.netlify) {
    return [];
  }

  const token = user.netlify.accessToken;

  try {
    const response = await axios.get("https://api.netlify.com/api/v1/sites", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const array = response.data;
    console.log(array[0]);
    const projectsArray: Promise<string>[] = array.map(async (project: any) => {
      console.log(project);
      const projectData = {
        id: project.id,
        siteId: project.site_id,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        domain: project.domain,
        name: project.name,
        url: project.url,
        repoUrl: project.build_settings.repo_url,
      };

      const deployments = await axios.get(
        `https://api.netlify.com/api/v1/sites/${project.id}/deploys`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = deployments.data;

      return `Project id: ${projectData.id}\n SiteId: ${
        projectData.siteId
      }\n Created At: ${projectData.createdAt}\n Updated At: ${
        projectData.updatedAt
      }\n Url: ${projectData.url}\n Repo: ${
        projectData.repoUrl
      }\n Deployments: ${data
        .map(
          (d: any) =>
            `Deploy id: ${d.id}\n  Name: ${d.name}\n Custom Domain: ${d.custom_domain}\n Deployed URL: ${d.url}\n Deployment Created At: ${d.created_at}\n Deployment Updated At ${d.updated_at}\n Deployment State: ${d.state}\n Deployment Url: ${d.deploy_url}\n`,
        )
        .join("\n")}`;
    });

    return Promise.all(projectsArray);
  } catch (error) {
    console.error("Error retrieving Netlify projects:", error.message);
    return [];
  }
}

export { getAllNetlifyData };
