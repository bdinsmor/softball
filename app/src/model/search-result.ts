export class SearchResult {

  constructor(
      public resourceName: string,
      public resourceDetails: string,
      public startTime: string,
      public endTime: string
    ) {
    // empty
  }
}

export class Ingredient {

  constructor(
      public name: string,
      public amount: string = '1',
      public units: string = 'cup',
      public notes: string = 'none'
    ) {
  }
}

export class Instruction {

  constructor(
      public notes: string,
      public imageUrl: string = 'none'
    ) {
      
  }
}

export class Category {

  constructor(
      public name: string = 'none'
    ) {
    // empty
  }
}