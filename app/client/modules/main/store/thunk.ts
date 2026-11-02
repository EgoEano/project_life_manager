import { createAsyncThunk } from '@reduxjs/toolkit';

type ExampleThunkPayload = {};
type ExampleThunkResult = {example: string;};

export const exampleThunk = createAsyncThunk<
    ExampleThunkResult,
    ExampleThunkPayload,
    { rejectValue: void; extra: any; }
>('main/example', async (payload, { extra, rejectWithValue }) => {
    const example = {example: "example"};
    if (!example) return rejectWithValue();
    return example;
});