"use server";

import axios from "axios";

const workspace = "lobadev";
const projectKey = "ZFUNCS";

export const bitbucketCreateRepository = async (
  auth,
  repositoryName,
  description = "",
  isPrivate = true
) => {
  try {
    const response = await axios.post(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${repositoryName}`,
      {
        scm: "git",
        description,
        is_private: isPrivate,
        project: { key: projectKey },
      },
      {
        auth,
      }
    );
    console.log("Repository created successfully:", response.data);
    return response.data;
  } catch (err) {
    console.log(err.response?.data || err.message);
    throw new Error("Error creating the repository");
  }
};

export const bitbucketGetRepository = async (auth, repositoryName) => {
  try {
    const response = await axios.get(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${repositoryName}`,
      {
        auth,
      }
    );
    return response.data;
  } catch (err) {
    console.log(err.response.data);
  }
};

export const bitbucketCommit = async (
  auth,
  repositoryName,
  formData,
  message
) => {
  try {
    formData.append("message", message);
    const response = await axios.post(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${repositoryName}/src`,
      formData,
      {
        auth,
      }
    );
    return response.data;
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
};

export const bitbucketUpdateRepositoryName = async (
  auth,
  oldRepositoryName,
  newRepositoryName
) => {
  try {
    const response = await axios.put(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${oldRepositoryName}`,
      {
        name: newRepositoryName,
      },
      {
        auth,
      }
    );

    return { data: response.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.error };
  }
};
