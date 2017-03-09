import { Component } from '@angular/core';
import { NavController, NavParams, SegmentButton, AlertController, ViewController } from 'ionic-angular';
import { Validators, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { Camera } from 'ionic-native';
import { counterRangeValidator } from '../../components/counter-input/counter-input';
import { IngredientComponent } from './ingredient-component';
import { InstructionComponent } from './instruction-component';
import { Ingredient, Instruction, Category } from '../../model/search-result';
import { GlobalStateService } from '../../services/global-state.service';
import { IamAuthorizerClient, UserPoolsAuthorizerClient } from "../../services/recipes-api.service";

@Component({
  selector: 'recipe-edit-page',
  providers: [GlobalStateService],
  templateUrl: 'recipe-edit.html'
})
export class RecipeEditPage {
  section: string;
  checkboxTagsForm: FormGroup;
  post_form: FormGroup;
  recipe: any;
  recipeId: string;
  image: string;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  ingredients: Array<Ingredient>;
  instructions: Array<Instruction>;

  constructor(
    private fb: FormBuilder,
    public navParams: NavParams,
    public nav: NavController,
    private globals: GlobalStateService, 
    private client: UserPoolsAuthorizerClient,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController) {
    if (navParams.get('recipe')) {
      this.recipe = navParams.get('recipe');
    //  console.log("recipe: " + JSON.stringify(this.recipe,null,2));
      this.recipeId = this.recipe.recipeId;
      this.instructions = this.recipe.instructions;
      this.ingredients = this.recipe.ingredients;
      this.image = this.recipe.image;
      this.checkboxTagsForm = new FormGroup({
        tag_1: new FormControl(false),
        tag_2: new FormControl(false),
        tag_3: new FormControl(false),
        tag_4: new FormControl(false),
        tag_5: new FormControl(false),
        tag_6: new FormControl(false),
      });
      this.post_form = new FormGroup({
        name: new FormControl(this.recipe.name, Validators.required),
        servings: new FormControl(this.recipe.servings, counterRangeValidator(10, 1)),
        time: new FormControl('01:30', Validators.required),
        temperature: new FormControl(180),
        categories: new FormControl(''),
        difficulty: new FormControl(this.recipe.difficulty)
      });
    } else {
      this.recipe = {
        
        name: 'New Recipe'
      };
      this.recipeId = '';
      this.section = "event";
      this.checkboxTagsForm = new FormGroup({
        tag_1: new FormControl(false),
        tag_2: new FormControl(false),
        tag_3: new FormControl(false),
        tag_4: new FormControl(false),
        tag_5: new FormControl(false),
        tag_6: new FormControl(false),
      });
      this.post_form = new FormGroup({
        name: new FormControl('', Validators.required),
        servings: new FormControl(8, counterRangeValidator(10, 1)),
        time: new FormControl('01:30', Validators.required),
        temperature: new FormControl(180),
        categories: new FormControl(''),
        difficulty: new FormControl('3')
      });
      this.ingredients = new Array<Ingredient>();
      this.instructions = new Array<Instruction>();
    }

  }

  takePicture() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000
    }).then((imageData) => {
      // imageData is a base64 encoded string
      this.image = "data:image/jpeg;base64," + imageData;
    }, (err) => {
      console.log(err);
    });
  }

  initIngredient() {
    return new Ingredient('3 cups flour','none','none','none');
  }

  initInstruction() {
    return new Instruction('Cream Butter','none');
  }

  addInstruction() {
    this.instructions.push(this.initInstruction());
    
  }

  removeInstruction(i: number) {
    this.instructions.splice(i,1);
  }

  addIngredient() {
    this.ingredients.push(this.initIngredient());
  }

  removeIngredient(i: number) {
    this.ingredients.splice(i,1);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  onSegmentChanged(segmentButton: SegmentButton) {
    // console.log('Segment changed to', segmentButton.value);
  }

  onSegmentSelected(segmentButton: SegmentButton) {
    // console.log('Segment selected', segmentButton.value);
  }

  saveRecipe() {
    if (this.post_form) {
      //
      console.log("recipeId: " + this.recipeId);
      this.recipe = this.post_form.value;
      this.recipe.recipeId = this.recipeId;
      this.recipe.ingredients = this.ingredients;
      this.recipe.instructions = this.instructions;
      this.recipe.image = this.image;
      let cat:string = '';
      let i = 0;
      for(var c of this.recipe.categories) {
        if(i > 0 ) {
          cat += " ";
        }
        cat += c.toLowerCase();
        i++;
      }
      this.recipe.category = cat;
      this.globals.displayLoader("Adding...");
      this.client.getClient().recipesCreate(this.recipe).subscribe(
        (data) => {
          
          this.globals.dismissLoader();
          this.globals.displayToast(`Recipe successfully added.`);
          this.nav.pop();
        },
        (err) => {
          this.globals.dismissLoader();
          this.globals.displayAlert('Error encountered',
            `An error occurred when trying to add the recipe. Please check the console logs for more information.`);
          console.error(err);
        }
      );
    }
  }


  chooseCategory() {
    let alert = this.alertCtrl.create({
      cssClass: 'category-prompt'
    });
    alert.setTitle('Category');

    alert.addInput({
      type: 'checkbox',
      label: 'Alderaan',
      value: 'value1',
      checked: true
    });

    alert.addInput({
      type: 'checkbox',
      label: 'Bespin',
      value: 'value2'
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Confirm',
      handler: data => {
        console.log('Checkbox data:', data);
        this.categories_checkbox_open = false;
        this.categories_checkbox_result = data;
      }
    });
    alert.present().then(() => {
      this.categories_checkbox_open = true;
    });
  }

}

export interface Instruction {
  notes: string;
}

export interface Ingredient {
  amount: number;
  units: string;
  name: string;
  notes: string;
}