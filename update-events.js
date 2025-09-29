const fs = require('fs/promises');
const path = require('path');

const API_URL = process.env.API_URL;

const README_PATH = path.join(__dirname, 'profile/README.md');

const START_MARKER = '<!-- START_EVENTS -->';
const END_MARKER = '<!-- END_EVENTS -->';

/**
 * Formats an ISO date string into "DD Month YYYY"
 * @param {string} isoString - The date string from the API.
 * @returns {string} The formatted date.
 */
function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Fetches events and generates the markdown content.
 */
async function fetchAndGenerateEvents() {
    if (!API_URL) {
        console.error('Error: API_URL environment variable not set.');
        process.exit(1); 
    }

    try {
        console.log(`Fetching events from ${API_URL}...`);
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const events = data.events;

        if (!events || events.length === 0) {
            console.log('No upcoming events found.');
            return 'No upcoming events found.';
        }

        console.log(`Found ${events.length} events.`);

        const markdownLines = events.map(event => {
            const startDate = formatDate(event.date);
            const endDate = formatDate(event['end-date']);
            const link = event.infoLink || event.registration;
            const title = event.title.trim();
            const dateRange = (startDate === endDate) ? startDate : `${startDate} - ${endDate}`;
            
            return `- ${dateRange} - [${title}](${link})`;
        });

        return markdownLines.join('\n');

    } catch (error) {
        console.error('Failed to fetch or process events:', error);
        return 'Could not retrieve events at this time.';
    }
}

/**
 * Updates the README.md file with the new content.
 */
async function updateReadme() {
    console.log('Starting README update...');
    const eventsMarkdown = await fetchAndGenerateEvents();

    try {
        const readmeContent = await fs.readFile(README_PATH, 'utf-8');
        const regex = new RegExp(`${START_MARKER}[\\s\\S]*${END_MARKER}`);
        const newContent = `${START_MARKER}\n${eventsMarkdown}\n${END_MARKER}`;
        
        if (!regex.test(readmeContent)) {
             console.error('Error: Markers not found in README.md. Please add them.');
             return;
        }

        const updatedReadme = readmeContent.replace(regex, newContent);
        await fs.writeFile(README_PATH, updatedReadme, 'utf-8');
        console.log('✅ README.md updated successfully!');

    } catch (error)
    {
        console.error('Failed to update README.md:', error);
    }
}

// Run the main function
updateReadme();