import React from 'react';
import OdiAvatar from './OdiAvatar';
import RahuAvatar from './RahuAvatar';

export default function CharacterAvatar({ characterId = 'odi', state = 'idle', className = 'w-24 h-24', isThinking = false }) {
    if (characterId === 'rahu') {
        return <RahuAvatar state={state} className={className} isThinking={isThinking} />;
    }
    return <OdiAvatar state={state} className={className} isThinking={isThinking} />;
}

