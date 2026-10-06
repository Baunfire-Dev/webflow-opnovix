import baunfire, { registerModules } from './baunfire.js';
import Global from '../site/global.js';
import Animation from '../site/animation.js';
import { BLOCKS } from '../blocks/index.js';

registerModules([Global, Animation, ...BLOCKS]);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => baunfire.ready());
} else {
    baunfire.ready();
}
