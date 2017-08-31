import deepmerge from 'deepmerge';

export default (x, y) => deepmerge(x, y, { arrayMerge: (arrX, arrY) => arrX.concat(arrY)});