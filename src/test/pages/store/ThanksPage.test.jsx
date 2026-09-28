import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ThanksPage from '@/pages/store/ThanksPage.jsx';

const ORDER_ID = '3f2a9c1b-7d4e-4a1a-9c3e-1234567890ab';

function renderThanksPage(id) {
  return render(
    <MemoryRouter initialEntries={[`/thanks/${id}`]}>
      <Routes>
        <Route path="/thanks/:id" element={<ThanksPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ThanksPage', () => {
  it('shows the short order number for a UUID route param', () => {
    renderThanksPage(ORDER_ID);

    expect(screen.getAllByText('#3F2A9C1B').length).toBeGreaterThan(0);
  });
});
