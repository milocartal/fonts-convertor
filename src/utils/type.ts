export type FontList = {
  familyMetadataList: Font[];
};

export type Font = {
  family: string;
  displayName: string;
  category: string;
  stroke: string;
  size: number;

  fonts: FontDetail[];

  designers: string[];
  lastModified: string;
  dateAdded: string;
};

export type FontDetail = {
  thickness: number;
  slant: number;
  width: number;
  lineHeight: number;
};
