import { PNGCollectionEncoder, PngImage } from '@nouns/sdk';
import { promises as fs } from 'fs';
import { PNG } from 'pngjs';
import path from 'path';

const DESTINATION = path.join(__dirname, '../src/image-data.json');

/**
 * Read a PNG image file and return a `PngImage` object.
 * @param path The path to the PNG file
 */
const readPngImage = async (path: string): Promise<PngImage> => {
  const buffer = await fs.readFile(path);
  const png = PNG.sync.read(buffer);

  return {
    width: png.width,
    height: png.height,
    rgbaAt: (x: number, y: number) => {
      const idx = (png.width * y + x) << 2;
      const [r, g, b, a] = [png.data[idx], png.data[idx + 1], png.data[idx + 2], png.data[idx + 3]];
      return {
        r,
        g,
        b,
        a,
      };
    },
  };
};

const encode = async () => {
  const encoder = new PNGCollectionEncoder();
  var monsterTypeStarts = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

  const partfolders = ['1-bodies', '2-accessories', '3-heads', '4-glasses'];
  var folderpart = -1;
  var lastmonstertype = -1;
  for (const folder of partfolders) {
    folderpart += 1
    var moncount = 0
    const folderpath = path.join(__dirname, '../images', folder);
    const files = await fs.readdir(folderpath);
    for (const file of files) {
      //Read the filename, grab the monster type from it
      const monstertype = parseInt(file.split("-")[0]);
      if (monstertype != lastmonstertype) {
        monsterTypeStarts[lastmonstertype][folderpart] = moncount;
        lastmonstertype = monstertype;
      }
      const image = await readPngImage(path.join(folderpath, file));
      encoder.encodeImage(file.replace(/\.png$/, ''), image, folder.replace(/^\d-/, ''));
      moncount += 1;
    }
  }
  console.table(monsterTypeStarts);
  var monsterhashes = [];
  for (var i = 0; i < monsterTypeStarts.length; i++) {
    var hashes = new Int8Array(4);
    var monsterhash = 0;
    hashes[0] = monsterTypeStarts[i][0];
    monsterhash = (monsterhash + hashes[0]);
    hashes[1] = monsterTypeStarts[i][1];
    monsterhash = ((monsterhash << 8) + hashes[1]);
    hashes[2] = monsterTypeStarts[i][2];
    monsterhash = ((monsterhash << 16) + hashes[2]);
    hashes[3] = monsterTypeStarts[i][3];
    monsterhash = ((monsterhash << 24) + hashes[3]);
    monsterhashes[i] = monsterhash;
  }
  await fs.writeFile(
    DESTINATION,
    JSON.stringify(
      {
        monstertypes: monsterhashes,
        bgcolors: ['d5d7e1', 'e1d7d5'],
        ...encoder.data,
      },
      null,
      2,
    ),
  );
};

encode();
