import { Router } from "express";
import caseDataRouter from "../routes/case-data";
import probateCaseDataRouter from "../routes/case-data-probate";
import homeRouter from "../routes/home";

export class RouterFinder {

  public static findAll(): Router[] {
    return [
      homeRouter,
      caseDataRouter,
      probateCaseDataRouter,
    ];
  }

}
