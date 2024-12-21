export async function load({ fetch }) {
    const filenames = ['shopping-list.json', 'recipe-list.json'];
    let content: { [key: string]: any } = {};

    for (const filename of filenames) {
        try {
            const response = await fetch(`/api/files?filename=${filename}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            content[filename] = data;
        }
        catch (error) {
            content[filename] = [];
            console.error(`Failed to load data for ${filename}:`, error);
        }
    }

    return {
        fileContent: content
    };
}