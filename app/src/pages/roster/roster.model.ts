export class RosterModel {
  name: string;
  image: string;
  description: string;
  coaches: CoachModel[];
  players: PlayerModel[];
}
export class PlayerModel {
  name: string;
  email: string;
  phone: string;
  image: string;
  description: string;
  birthdate: Date;
  year: number;
  season: string;
}

export class CoachModel {
  name: string;
  email: string;
  phone: string;
}

