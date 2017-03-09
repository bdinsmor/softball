import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'instruction',
    templateUrl: 'recipe-instruction.html'
})
export class InstructionComponent {
    // we will pass in address from App component
    @Input('group')
    public instructionForm: FormGroup;
}