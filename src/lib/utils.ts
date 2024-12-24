import type { Recipe } from "$lib/types"

export async function saveToFile(filename: string, content: any) {
    try {
      const response = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      const result = await response.json();
      console.log("Changes saved successfully:", result);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  }

export function largestKey(arr: string[]): number {
    if (!arr || arr.length === 0) return 0;
    
    const numbers = arr.map(Number).filter(num => !isNaN(num));
    return numbers.length > 0 ? Math.max(...numbers) : 0;
  }