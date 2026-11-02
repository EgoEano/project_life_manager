import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { exampleThunk } from './thunk';

interface ExampleState {
    example: string;
}

const initialState: ExampleState = {
    example: '',
};

const exampleSlice = createSlice({
    name: 'example',
    initialState,
    reducers: {
        setExample: (state, action: PayloadAction<string>) => {
            state.example = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(exampleThunk.pending, (state) => {
                state.example = "pending";
            })
            .addCase(exampleThunk.fulfilled, (state, action) => {
                state.example = "fulfilled";
            })
            .addCase(exampleThunk.rejected, (state, action) => {
                state.example = "rejected";
            })

    },
});

export const { setExample } = exampleSlice.actions;
export default exampleSlice.reducer;
