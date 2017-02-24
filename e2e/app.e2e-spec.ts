import { StreamvisualizerPage } from './app.po';

describe('streamvisualizer App', () => {
  let page: StreamvisualizerPage;

  beforeEach(() => {
    page = new StreamvisualizerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
