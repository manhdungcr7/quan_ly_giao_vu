const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const https = require('https');

const FONT_DIR = path.join(__dirname, '../../storage/fonts/pdf');

const FONT_CONFIG = [
    {
        key: 'regular',
        filename: 'NotoSans-Regular.ttf',
        url: 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf'
    },
    {
        key: 'bold',
        filename: 'NotoSans-SemiBold.ttf',
        url: 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-SemiBold.ttf'
    }
];

function downloadFont(url, targetPath, redirectsLeft = 5) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            const { statusCode, headers } = response;

            if ([301, 302, 303, 307, 308].includes(statusCode) && headers.location) {
                if (redirectsLeft <= 0) {
                    response.resume();
                    return reject(new Error(`Too many redirects while downloading font: ${url}`));
                }

                const nextUrl = new URL(headers.location, url).toString();
                response.resume();
                return downloadFont(nextUrl, targetPath, redirectsLeft - 1).then(resolve).catch(reject);
            }

            if (statusCode !== 200) {
                response.resume();
                return reject(new Error(`Failed to download font: ${url} (status ${statusCode})`));
            }

            const fileStream = fs.createWriteStream(targetPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => fileStream.close(resolve));
            fileStream.on('error', (error) => {
                fsPromises.unlink(targetPath).catch(() => {});
                reject(error);
            });
        });

        request.on('error', (error) => {
            fsPromises.unlink(targetPath).catch(() => {});
            reject(error);
        });
    });
}

async function ensurePdfFonts() {
    const ensured = {};

    try {
        await fsPromises.mkdir(FONT_DIR, { recursive: true });

        for (const font of FONT_CONFIG) {
            const targetPath = path.join(FONT_DIR, font.filename);
            const exists = await fsPromises
                .access(targetPath, fs.constants.F_OK)
                .then(() => true)
                .catch(() => false);

            if (!exists) {
                await downloadFont(font.url, targetPath);
            }

            ensured[font.key] = targetPath;
        }
    } catch (error) {
        console.warn('Unable to ensure custom PDF fonts. Falling back to built-in fonts.', error.message || error);
        return ensured;
    }

    return ensured;
}

module.exports = {
    ensurePdfFonts
};
