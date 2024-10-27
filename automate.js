const fs = require('fs');
const path = require('path');

const appFilePath = path.join(__dirname, 'app.js');

fs.readFile(appFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading app.js:', err);
        return;
    }

    const regex = /(?:let downloadCommand;[\s\S]*?)(if \(format === 'audio'\) \{[\s\S]*?})/;

    if (!regex.test(data)) {
        console.error('Could not find the download command section in app.js');
        return;
    }

    if (data.includes('const cookiesOption = `--cookies')) {
        console.log('The modification for cookiesOption already exists. No changes made.');
        return;
    }

    const modifiedData = data.replace(regex, (match, p1) => {
        const cookiesOption = `const cookiesOption = \`--cookies "\${cookiesFilePath}"\`;\n`;

        const newCommand = `
            ${cookiesOption}
            if (format === 'audio') {
                downloadCommand = \`yt-dlp -x --audio-format mp3 --ffmpeg-location "\${FFMPEG_PATH}" -o "\${outputPath}" \${cookiesOption} "\${url}"\`;
            } else {
                downloadCommand = \`yt-dlp -f "bestvideo+bestaudio/best" --ffmpeg-location "\${FFMPEG_PATH}" -o "\${webmPath}" \${cookiesOption} "\${url}"\`;
            }
        `;

        return `${match.replace(p1, newCommand)}`;
    });

    fs.writeFile(appFilePath, modifiedData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to app.js:', err);
            return;
        }

        console.log('app.js has been successfully updated with the cookies option.');
    });
});
