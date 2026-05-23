// Example usage of simple auto-reload in existing components
import { enhancedFetch, withDbRetry } from './enhanced-fetch';

// 1. For API calls - replace fetch with enhancedFetch
export async function getUserData(userId: string) {
  const response = await enhancedFetch(`/api/users/${userId}`);
  return response.json();
}

// 2. For database operations - wrap with withDbRetry
export async function updateUserPoints(userId: string, points: number) {
  return withDbRetry(async () => {
    // Your existing database logic here
    const response = await fetch(`/api/users/${userId}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points })
    });
    return response.json();
  });
}

// 3. For component data loading
export async function loadDirectoryItems() {
  return withDbRetry(async () => {
    const response = await enhancedFetch('/api/directory');
    return response.json();
  });
}

// 4. For chat messages
export async function sendChatMessage(message: string, userId: string) {
  return withDbRetry(async () => {
    const response = await enhancedFetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId })
    });
    return response.json();
  });
}

// 5. For profile operations
export async function uploadProfilePhoto(file: File, userId: string) {
  return withDbRetry(async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    const response = await enhancedFetch('/api/profile-photo', {
      method: 'POST',
      body: formData
    });
    return response.json();
  });
}
