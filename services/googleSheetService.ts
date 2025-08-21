
const API_URL = 'https://script.google.com/macros/s/AKfycbxN_P9tB-rr6kVKy9MZwnZ2qb-c8meyTZaloyAglJ48xuJdbopda7PQsROJyipYGzfskw/exec';

export const getResources = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch resources');
  }
  const data = await response.json();
  const resources = data.data || [];
  // Ensure all IDs are strings to prevent type mismatches, which can break lookup features.
  return resources.map((resource) => ({
      ...resource,
      id: String(resource.id),
  }));
};

export const createResource = async (resource) => {
  const formData = new FormData();
  formData.append('action', 'create');
  formData.append('title', resource.title);
  formData.append('Subject_Name', resource.Subject_Name);
  formData.append('video_link', resource.video_link);
  formData.append('pdf_link', resource.pdf_link);
  formData.append('image_url', resource.image_url);

  // This format is often better handled by Google App Scripts
  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: formData,
  });
};


export const updateResource = async (resource) => {
    const formData = new FormData();
    formData.append('action', 'update');
    formData.append('id', resource.id);
    formData.append('title', resource.title);
    formData.append('Subject_Name', resource.Subject_Name);
    formData.append('video_link', resource.video_link);
    formData.append('pdf_link', resource.pdf_link);
    formData.append('image_url', resource.image_url);

    await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    });
};


export const deleteResource = async (id) => {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);

    await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    });
};