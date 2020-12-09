import matchMediaMock from '../utilities/testing/matchMedia';
import { getPreferredTheme, listenForThemeChange, ColorTheme, Mode } from '../theme';

const matchMedia = matchMediaMock();

describe('getPreferredTheme', () => {
  test('renders the selected screen', () => {
    expect(getPreferredTheme()).toEqual(ColorTheme.Light);
    matchMedia.useMediaQuery(Mode.Dark);
    expect(getPreferredTheme()).toEqual(ColorTheme.Dark);
  });
});

describe('listenForThemeChange', () => {
  test('renders the selected screen', async () => {
    const cb = jest.fn();
    listenForThemeChange(cb);
    matchMedia.useMediaQuery(Mode.Dark);
    expect(cb).toHaveBeenCalledWith(ColorTheme.Dark);
  });
});