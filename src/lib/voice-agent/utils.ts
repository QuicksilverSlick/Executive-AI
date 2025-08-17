export function templatizeInstructions(instructions: string, data: Record<string, string>): string {
  return instructions.replace(/\{\{(\w+)\}\}/g, (placeholder, key) => {
    return data[key] || placeholder;
  });
}
