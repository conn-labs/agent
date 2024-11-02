import axios from "axios";
import { VTEST } from "../../constants";
import { prisma } from "../../lib";

async function getAllVercelProjects(email: string): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    return [];
  }
  const token = user.vercel?.accessToken;
  const { data } = await axios.get("https://api.vercel.com/v1/projects", {
    headers: {
      Authorization: `Bearer ${VTEST}`,
    },
  });
  if (data.error) {
    return [];
  }
  console.log(data);
  const projectDataArray: Promise<string>[] = data.map(async (project: any) => {
    const projectData = {
      id: project.id,
      framework: project.framework,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      live: project.live,
      link: JSON.stringify(project.link),
    };
    return `Project id: ${projectData.id} \n Framework: ${projectData.framework} \n Created At: ${projectData.createdAt} \n Updated At: ${projectData.updatedAt} \n Live: ${projectData.live} \n Link: ${projectData.link} \n \n`;
  });

  return Promise.all(projectDataArray);
}

async function getAllVercelAliases(email: string): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    return [];
  }
  const token = user.vercel?.accessToken;
  const { data } = await axios.get("https://api.vercel.com/v1/aliases", {
    headers: {
      Authorization: `Bearer ${VTEST}`,
    },
  });
  if (data.error) {
    return [];
  }
  console.log(data);
  const aliastDataArray: Promise<string>[] = data.map(async (project: any) => {
    const projectData = {
      id: project.uid,
      alias: project.alias,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      deploymentId: project.deploymentId,
      projectId: project.projectId,
      redirect: JSON.stringify(project.redirect),
    };
    return `Alias Id: ${projectData.id} \n Alias: ${projectData.alias} \n Created At: ${projectData.createdAt} \n Updated At: ${projectData.updatedAt} \n Deployment Id: ${projectData.deploymentId} \n Project Id: ${projectData.projectId} \n Redirect: ${projectData.redirect} \n \n`;
  });

  return Promise.all(aliastDataArray);
}

async function getAllVercelDeployment(email: string): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    return [];
  }
  const token = user.vercel?.accessToken;
  const { data } = await axios.get("https://api.vercel.com/v6/deployments", {
    headers: {
      Authorization: `Bearer ${VTEST}`,
    },
  });
  if (data.error) {
    return [];
  }
  console.log(data);
  const deploymentsArray: Promise<string>[] = data.deployments.map(
    async (deployments: any) => {
      const projectData = {
        id: deployments.uid,
        name: deployments.name,
        createdAt: deployments.createdAt,
        buildingAt: deployments.buildingAt,
        target: deployments.target,
        inspectorUrl: deployments.inspectorUrl,
        type: deployments.type,
        url: deployments.url,
        state: deployments.state,
        readyState: deployments.readyState,
        alias: deployments.aliasAssigned,
        ready: deployments.ready,
        readState: deployments.readyState,
        readySubState: deployments.readySubState,
        redirect: JSON.stringify(deployments.redirect),
      };
      return `Deployment Id: ${projectData.id} \n Name: ${projectData.name} \n Created At: ${projectData.createdAt} \n Building At: ${projectData.buildingAt} \n Target: ${projectData.target} \n Inspector Url: ${projectData.inspectorUrl} \n Type: ${projectData.type} \n Url: ${projectData.url} \n State: ${projectData.state} \n Ready State: ${projectData.readyState} \n Alias: ${projectData.alias} \n Ready: ${projectData.ready} \n Read State: ${projectData.readState} \n Ready Sub State: ${projectData.readySubState} \n Redirect: ${projectData.redirect} \n \n`;
    },
  );

  return Promise.all(deploymentsArray);
}

async function getAllTeams(email: string): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    return [];
  }
  const token = user.vercel?.accessToken;
  const { data } = await axios.get("https://api.vercel.com/v2/teams", {
    headers: {
      Authorization: `Bearer ${VTEST}`,
    },
  });
  if (data.error) {
    return [];
  }
  console.log(data);
  const aliastDataArray: Promise<string>[] = data.teams.map(
    async (teams: any) => {
      const teamsData = {
        id: teams.id,
        slug: teams.slug,
        name: teams.name,
        createdAt: teams.createdAt,
        creatorId: teams.creatorId,
        updatedAt: teams.updatedAt,
        billing: JSON.stringify(teams.billing),
        description: teams.description,
      };
      return `TeamsId: ${teamsData.id} \n Slug: ${teamsData.slug} \n Name: ${teamsData.name} \n Created At: ${teamsData.createdAt} \n Creator Id: ${teamsData.creatorId} \n Updated At: ${teamsData.updatedAt} \n Billing: ${teamsData.billing} \n Description: ${teamsData.description} \n \n`;
    },
  );

  return Promise.all(aliastDataArray);
}

function getAllVercelData(email: string): Promise<string[]> {
  const promises = [
    getAllVercelProjects(email),
    getAllVercelAliases(email),
    getAllVercelDeployment(email),
    getAllTeams(email),
  ];
  return Promise.all(promises).then((data) => {
    return data.flat();
  });
}
export {
  getAllVercelProjects,
  getAllVercelAliases,
  getAllVercelDeployment,
  getAllTeams,
  getAllVercelData,
};
