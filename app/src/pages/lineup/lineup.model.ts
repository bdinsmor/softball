export class LineupModel {
    battingOrder: Array<PlayerModel> = [];
    fielding: Array<FieldingInning> = [];
}

export class PlayerModel {
    name: String;
}

export class FieldingInning {
    inning: String;
    positions: Array<FieldingModel>;
}


export class FieldingModel {
    player: PlayerModel;
    position: PositionModel;
}

export class PositionModel {
    name: String;
    abbr: String;
    label: String;
}
