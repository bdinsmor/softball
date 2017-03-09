import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'ingredient',
    templateUrl: 'recipe-ingredient.html'
})
export class IngredientComponent {
    // we will pass in ingredient from App component
    @Input('group')
    public ingredientForm: FormGroup;
}