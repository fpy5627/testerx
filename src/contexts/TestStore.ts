import create from "zustand";

export type Answer = { id: number; score: number };
export type Result = Record<string, number>;

interface TestState {
  current: number;
  answers: Answer[];
  result: Result;
  setAnswer: (answer: Answer) => void;
  next: () => void;
  prev: () => void;
  setResults: (result: Result) => void;
  reset: () => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  current: 0,
  answers: [],
  result: {},
  setAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers.filter((a) => a.id !== answer.id), answer],
    })),
  next: () => set((state) => ({ current: state.current + 1 })),
  prev: () => set((state) => ({ current: Math.max(0, state.current - 1) })),
  setResults: (result) => set({ result }),
  reset: () => set({ current: 0, answers: [], result: {} }),
}));
