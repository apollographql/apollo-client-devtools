import matchMediaMock from '../utilities/testing/matchMedia';
import { getPreferredTheme, listenForThemeChange, ColorTheme, Mode } from '../theme';

const matchMedia = matchMediaMock();

describe('getPreferredTheme', () => {
  test('returns the preferred theme', () => {
    expect(getPreferredTheme()).toEqual(ColorTheme.Light);
    matchMedia.useMediaQuery(Mode.Dark);
    expect(getPreferredTheme()).toEqual(ColorTheme.Dark);
  });
});

describe('listenForThemeChange', () => {
  test('fires the callback on theme change', async () => {
    const cb = jest.fn();
    listenForThemeChange(cb);
    matchMedia.useMediaQuery(Mode.Dark);
    expect(cb).toHaveBeenCalledWith(ColorTheme.Dark);
  });
});