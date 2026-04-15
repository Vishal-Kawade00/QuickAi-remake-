import fs from 'fs-extra';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  try {
    console.log('🚀 Starting build process...');
    
    // Clean dist folder
    await fs.emptyDir(path.join(__dirname, 'dist'));
    console.log('✅ Cleaned dist folder');
    
    // Run Vite build
    console.log('📦 Running Vite build...');
    await new Promise((resolve, reject) => {
      exec('npx vite build', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
          console.error('Vite build error:', error);
          reject(error);
        } else {
          console.log(stdout);
          resolve();
        }
      });
    });
    
    // Copy manifest
    await fs.copy(
      path.join(__dirname, 'public', 'manifest.json'),
      path.join(__dirname, 'dist', 'manifest.json')
    );
    console.log('✅ Copied manifest.json');
    
    // Copy icons
    const iconsSrc = path.join(__dirname, 'public', 'icons');
    const iconsDest = path.join(__dirname, 'dist', 'icons');
    
    if (await fs.pathExists(iconsSrc)) {
      await fs.copy(iconsSrc, iconsDest);
      console.log('✅ Copied icons');
    }
    
    // Copy CSS files
    const cssFiles = await fs.readdir(path.join(__dirname, 'src', 'content'));
    for (const file of cssFiles) {
      if (file.endsWith('.css')) {
        await fs.copy(
          path.join(__dirname, 'src', 'content', file),
          path.join(__dirname, 'dist', 'assets', file)
        );
        console.log(`✅ Copied ${file}`);
      }
    }
    
    // Manually copy popup.js if it exists in src/popup
    const sourcePopupJs = path.join(__dirname, 'src', 'popup', 'Popup.js');
    const destPopupJs = path.join(__dirname, 'dist', 'popup.js');
    
    if (await fs.pathExists(sourcePopupJs)) {
      await fs.copy(sourcePopupJs, destPopupJs);
      console.log('✅ Copied popup.js from src/popup');
    }
    
    // Remove any duplicate popup files
    const distFiles = await fs.readdir(path.join(__dirname, 'dist'));
    for (const file of distFiles) {
      if (file.startsWith('popup') && file !== 'popup.js' && file !== 'popup.html') {
        await fs.remove(path.join(__dirname, 'dist', file));
        console.log(`✅ Removed duplicate: ${file}`);
      }
    }
    
    // List dist contents
    console.log('\n📁 Final build contents:');
    const files = await fs.readdir(path.join(__dirname, 'dist'));
    for (const file of files) {
      const stats = await fs.stat(path.join(__dirname, 'dist', file));
      console.log(`   ${file} (${stats.size} bytes)`);
    }
    
    console.log('\n✅ Extension built successfully!');
    console.log('📦 Load the extension from: dist folder');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();