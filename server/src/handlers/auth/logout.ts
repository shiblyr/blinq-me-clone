export const logout = async (): Promise<{ success: boolean }> => {
  // For simple token-based auth, logout is typically handled client-side by removing the token
  // This endpoint serves as a placeholder for server-side cleanup if needed
  return { success: true };
};