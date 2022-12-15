import { ReactNode, createContext, useContext, useReducer } from 'react';

export type Dispatch = React.Dispatch<Action>;
export type State = typeof defaultState;
export type Action = ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];

type ActionMap<M extends { [index: string]: unknown }> = {
    [Key in keyof M]: M[Key] extends undefined
        ? {
              type: Key;
          }
        : {
              type: Key;
              payload: M[Key];
          };
};

const defaultState = {
    simpleState: '',
};

export enum ActionTypes {
    setSimpleState,
}

export type ActionPayload = {
    [ActionTypes.setSimpleState]: {
        simpleState: string;
    };
};

function reducer(state: State, action: Action) {
    switch (action.type) {
        case ActionTypes.setSimpleState: {
            return { ...state, simpleState: action.payload.simpleState };
        }
        default: {
            return state;
        }
    }
}

export const GlobalContext = createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, defaultState);

    return <GlobalContext.Provider value={{ state, dispatch }}>{children}</GlobalContext.Provider>;
}

export function useGlobalContext() {
    const context = useContext(GlobalContext);

    if (!context) throw new Error('useGlobalContext must be used inside a GlobalProvider');

    return context;
}
