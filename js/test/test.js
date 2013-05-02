describe("SmaaController", function() {
	var scope1;
	var scope2;

	beforeEach(function() {
		scope1 = {};
		var ctrl1 = SmaaController(scope1, exampleProblem());

		scope2 = {};
		var problem = exampleProblem();
		problem.criteria["Bleed"].pvf.type = "linear-increasing";
		var ctrl2 = SmaaController(scope2, problem);
	});

	it("should have a problem", function() {
		expect(scope1.problem);
	});

	it("should determine worst values", function() {
		expect(scope1.problem.criteria["Prox DVT"].worst()).toEqual(0.25);
		expect(scope1.problem.criteria["Bleed"].worst()).toEqual(0.1);

		expect(scope2.problem.criteria["Bleed"].worst()).toEqual(0.0);
	});

	it("should determine best values", function() {
		expect(scope1.problem.criteria["Prox DVT"].best()).toEqual(0.0);
		expect(scope1.problem.criteria["Bleed"].best()).toEqual(0.0);

		expect(scope2.problem.criteria["Bleed"].best()).toEqual(0.1);
	});

	describe("The currentStep should be initialized with Ordinal", function() {
		it("should be described as ordinal", function() {
			expect(scope1.currentStep).toBeDefined();
			expect(scope1.currentStep.type).toEqual("ordinal");
			expect(scope1.currentStep.title).toEqual("Ordinal SWING weighting (1/2)");
		});

		it("should not be done", function() {
			expect(scope1.currentStep.type).toEqual("ordinal");
			expect(scope1.currentStep.done).toEqual(false);
		});

		it("should have the worst alternative as reference", function() {
			expect(scope1.currentStep.reference).toEqual({"Prox DVT" : 0.25, "Dist DVT" : 0.4, "Bleed" : 0.1});
			expect(scope2.currentStep.reference).toEqual({"Prox DVT" : 0.25, "Dist DVT" : 0.4, "Bleed" : 0.0});
		});

		it("should have a single criterion improved from worst to best in each choice", function() {
			expect(scope1.currentStep.choices).toEqual({
				"Prox DVT" : {"Prox DVT" : 0.0,  "Dist DVT" : 0.4,  "Bleed" : 0.1},
				"Dist DVT" : {"Prox DVT" : 0.25, "Dist DVT" : 0.15, "Bleed" : 0.1},
				"Bleed"    : {"Prox DVT" : 0.25, "Dist DVT" : 0.4,  "Bleed" : 0.0}
			});
		});

		it("should have an empty order", function() {
			expect(scope1.currentStep.order).toEqual([]);
		});
	});

	describe("Advance to the nextStep()", function() {
		it("should not go to next step without valid selection", function() {
			expect(scope1.nextStep()).toEqual(false);
			scope1.currentStep.choice = "CHF";
			expect(scope1.nextStep()).toEqual(false);
		});

		it("should have the choice as new reference", function() {
			scope1.currentStep.choice = "Prox DVT";
			expect(scope1.nextStep()).toEqual(true);
			expect(scope1.currentStep.reference).toEqual({"Prox DVT" : 0.0, "Dist DVT" : 0.4, "Bleed" : 0.1});
			expect(scope1.currentStep.choice).toBeUndefined();
			expect(scope1.currentStep.type).toEqual("ordinal");
			expect(scope1.currentStep.title).toEqual("Ordinal SWING weighting (2/2)");

			scope2.currentStep.choice = "Dist DVT";
			expect(scope2.nextStep()).toEqual(true);
			expect(scope2.currentStep.reference).toEqual({"Prox DVT" : 0.25, "Dist DVT" : 0.15, "Bleed" : 0.0});
			expect(scope2.currentStep.type).toEqual("ordinal");
		});

		it("should not contain previous choice", function() {
			scope1.currentStep.choice = "Prox DVT";
			expect(scope1.nextStep()).toEqual(true);
			expect(_.keys(scope1.currentStep.choices)).toEqual(["Dist DVT", "Bleed"]);
		});

		it("should improve previous choice on all choices", function() {
			scope1.currentStep.choice = "Prox DVT";
			expect(scope1.nextStep()).toEqual(true);
			expect(scope1.currentStep.choices).toEqual({
				"Dist DVT" : {"Prox DVT" : 0.0, "Dist DVT" : 0.15, "Bleed" : 0.1},
				"Bleed"    : {"Prox DVT" : 0.0, "Dist DVT" : 0.4,  "Bleed" : 0.0}
			});
		});

		it("should push the choice onto the order", function() {
			scope1.currentStep.choice = "Prox DVT";
			expect(scope1.nextStep()).toEqual(true);
			expect(scope1.currentStep.order).toEqual(["Prox DVT"]);
		});

		it("should finish when only a single choice left", function() {
			scope1.currentStep.choice = "Prox DVT";
			expect(scope1.nextStep()).toEqual(true);
			scope1.currentStep.choice = "Dist DVT";
			expect(scope1.nextStep()).toEqual(true);
			expect(scope1.currentStep.type).not.toEqual("ordinal");
			expect(scope1.currentStep.order).toEqual(["Prox DVT", "Dist DVT", "Bleed"]);
		});

		it("should transition to methods choice when ordinal is done", function() {
			scope1.currentStep.choice = "Prox DVT";
			expect(scope1.nextStep()).toEqual(true);
			scope1.currentStep.choice = "Dist DVT";
			expect(scope1.nextStep()).toEqual(true);
			expect(scope1.currentStep.type).toEqual("choose-method");
			expect(scope1.currentStep.done).toEqual(false);
			expect(scope1.currentStep.choice).toBeUndefined();
			expect(scope1.currentStep.methods).toEqual({"ratio bound": "Continue with ratio bound preferences", "done": "Done eliciting preferences"});
		});
	});

	describe("Go back to the previousStep()", function() {
		it("should not go back if on the first step", function() {
			expect(scope1.previousStep()).toEqual(false);
		});

		it("should reset to the previous state", function() {
			scope1.currentStep.choice = "Prox DVT";
			expect(scope1.nextStep()).toEqual(true);
			expect(scope1.previousStep()).toEqual(true);
			expect(scope1.currentStep.order).toEqual([]);
			expect(scope1.currentStep.reference).toEqual({"Prox DVT" : 0.25, "Dist DVT" : 0.4, "Bleed" : 0.1});
			expect(_.keys(scope1.currentStep.choices)).toEqual(["Prox DVT", "Dist DVT", "Bleed"]);
			expect(scope1.currentStep.title).toEqual("Ordinal SWING weighting (1/2)");
			expect(scope1.currentStep.choice).toEqual("Prox DVT");
		});

		it("should remember the next state", function() {
			scope1.currentStep.choice = "Prox DVT";
			expect(scope1.nextStep()).toEqual(true);
			scope1.currentStep.choice = "Bleed";
			expect(scope1.nextStep()).toEqual(true); // Done

			expect(scope1.previousStep()).toEqual(true);
			expect(scope1.currentStep.choice).toEqual("Bleed");

			expect(scope1.previousStep()).toEqual(true);
			expect(scope1.currentStep.choice).toEqual("Prox DVT");
			expect(scope1.nextStep()).toEqual(true);
			expect(scope1.currentStep.choice).toEqual("Bleed");
			expect(scope1.nextStep()).toEqual(true);
		});

		it("should reset the next state on a different choice", function() {
			scope1.currentStep.choice = "Prox DVT";
			expect(scope1.nextStep()).toEqual(true);
			scope1.currentStep.choice = "Bleed";
			expect(scope1.nextStep()).toEqual(true); // Done

			expect(scope1.previousStep()).toEqual(true); // Step 2
			expect(scope1.currentStep.choice).toEqual("Bleed");

			expect(scope1.previousStep()).toEqual(true); // Step 1
			expect(scope1.currentStep.choice).toEqual("Prox DVT");
			scope1.currentStep.choice = "Bleed";
			expect(scope1.nextStep()).toEqual(true); // Step 2
			expect(scope1.currentStep.choice).toBeUndefined();

			scope1.currentStep.choice = "Dist DVT";
			expect(scope1.nextStep()).toEqual(true); // Done
			expect(scope1.currentStep.choice).toBeUndefined();
			expect(scope1.currentStep.order).toEqual(["Bleed", "Dist DVT", "Prox DVT"]);
		});

		it("should correctly reset the last state on a different choice", function() {
			scope1.currentStep.choice = "Prox DVT";
			expect(scope1.nextStep()).toEqual(true);
			scope1.currentStep.choice = "Bleed";
			expect(scope1.nextStep()).toEqual(true); // Done

			expect(scope1.previousStep()).toEqual(true); // Step 2
			expect(scope1.currentStep.choice).toEqual("Bleed");
			scope1.currentStep.choice = "Dist DVT";
			expect(scope1.nextStep()).toEqual(true); // Done

			expect(scope1.currentStep.choice).toBeUndefined();
			expect(scope1.currentStep.order).toEqual(["Prox DVT", "Dist DVT", "Bleed"]);
		});
	});

});
