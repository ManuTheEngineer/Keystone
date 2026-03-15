import type { ProjectPhase, EducationModule } from "../../types";
import { TOGO_EDUCATION_DEFINE } from "./define";
import { TOGO_EDUCATION_FINANCE } from "./finance";
import { TOGO_EDUCATION_LAND } from "./land";
import { TOGO_EDUCATION_DESIGN } from "./design";
import { TOGO_EDUCATION_APPROVE } from "./approve";
import { TOGO_EDUCATION_ASSEMBLE } from "./assemble";
import { TOGO_EDUCATION_BUILD } from "./build";
import { TOGO_EDUCATION_VERIFY } from "./verify";
import { TOGO_EDUCATION_OPERATE } from "./operate";

export const TOGO_EDUCATION: Record<ProjectPhase, EducationModule> = {
  DEFINE: TOGO_EDUCATION_DEFINE,
  FINANCE: TOGO_EDUCATION_FINANCE,
  LAND: TOGO_EDUCATION_LAND,
  DESIGN: TOGO_EDUCATION_DESIGN,
  APPROVE: TOGO_EDUCATION_APPROVE,
  ASSEMBLE: TOGO_EDUCATION_ASSEMBLE,
  BUILD: TOGO_EDUCATION_BUILD,
  VERIFY: TOGO_EDUCATION_VERIFY,
  OPERATE: TOGO_EDUCATION_OPERATE,
};
