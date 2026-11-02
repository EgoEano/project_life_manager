import ReactDOM from 'react-dom/client';
import { App } from './App';


export default async function initWebApp() {
    try {
        const root = InitWebRoot();
        root.render(<App />);
    } catch (error) {
        console.error("Critical Web Bootstrap Error:", error);
    }
}

function InitWebRoot(): ReactDOM.Root {
    let appNode = document.getElementById('app');
    if (!appNode) {
        appNode = document.createElement('div');
        appNode.id = 'app';
        document.body.appendChild(appNode);
    }
    document.title = 'App';

    Object.assign(appNode.style, {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        maxHeight: '100dvh',
        scrollbarGutter: 'stable',
        fontSize: '1rem',
        backgroundColor: '#fff',
    });

    return ReactDOM.createRoot(appNode);
}