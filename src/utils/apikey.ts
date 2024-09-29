export function generateApiKey(length: number = 32): string {
    const prefix = 'quark_';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let apiKey = prefix;
  
    for (let i = 0; i < length - prefix.length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      apiKey += characters[randomIndex];
    }
  
    return apiKey;
}