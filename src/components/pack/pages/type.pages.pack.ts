export type JsonPackPage = {
  id: string;
  type: string;
  pageNumber: number;
  items: JsonPackPageItem[];
};

export type JsonPackPageItem = {
  id: string;
  type: string;
  position: number;
  bodyContent?: JsonPackPageItemContent[];
  headContent?: JsonPackPageItemContent;
};

export type JsonPackPageItemContent = {
  id: string;
  value: string;
  isCorrectAnswer: boolean;
};
