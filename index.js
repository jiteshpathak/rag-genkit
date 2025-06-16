import {genkit} from 'genkit';
import { googleAI, GoogleAIPlugin } from '@genkit-ai/googleai';

const ai = genkit (
    {
        plugins: [googleAI()],
    }
);