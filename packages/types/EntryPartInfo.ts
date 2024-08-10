import type { inducks_entry, inducks_storyversion } from "~prisma-schemas/schemas/coa";


export type AllNonNullable<T> = {
    [P in keyof T]: NonNullable<T[P]>;
};

export type EntryPartInfo = AllNonNullable<
    Pick<inducks_entry, "part"> &
    Pick<inducks_storyversion, "estimatedpanels"> & {
        total_estimatedpanels: inducks_storyversion["estimatedpanels"];
    }
>;
