export interface Feedback {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    position?: { x: number; y: number };
    duration?: number;
  }
  
  export interface PersonalityTrait {
    name: string;
    value: number;
    icon: string;
  }
  
  export interface AIPersonalityState {
    traits: PersonalityTrait[];
    currentMood: string;
    adaptationLevel: number;
  }