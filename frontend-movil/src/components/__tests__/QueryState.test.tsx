import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';
import QueryState from '../QueryState';

describe('QueryState', () => {
    it('muestra el estado de carga', async () => {
        const screen = await render(<QueryState kind="loading" />);
        expect(screen.getByText('Consultando parqueaderos...')).toBeTruthy();
    });

    it('muestra el estado vacío', async () => {
        const screen = await render(<QueryState kind="empty" />);
        expect(screen.getByText('Sin resultados')).toBeTruthy();
        expect(screen.getByText('No hay parqueaderos visibles en esta zona.')).toBeTruthy();
    });

    it('muestra error y permite reintentar', async () => {
        const retry = jest.fn();
        const screen = await render(<QueryState kind="error" message="Red no disponible" onRetry={retry} />);
        expect(screen.getByText('Red no disponible')).toBeTruthy();
        await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
        expect(retry).toHaveBeenCalledTimes(1);
    });
});
