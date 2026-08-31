import { createContext, useContext } from "react";

type SideMenuValue = {
    openMenu: () => void;
};

export const SideMenuContext = createContext<SideMenuValue>({
    openMenu: () =>{},
});

export function useSideMenu(){
    return useContext(SideMenuContext)
}

