import { mrnScanerService } from './mrn-scaner';
import { updateDoctorService } from './doctor';
import { getPatientMolesService,
         addMoleService,
         getMoleService,
         updateMoleService,
       } from './mole';
import { addMolePhotoService,
         getMolePhotoService,
         updateMolePhotoService,
       } from './photo';
import { addAnatomicalSitePhotoService, getAnatomicalSitesService } from './anatomical-site.js';
import { patientsService,
         createPatientService,
         updatePatientService,
       } from './patients';


export default {
    mrnScanerService,
    updateDoctorService,
    getPatientMolesService,
    addMoleService,
    getMoleService,
    updateMoleService,
    addMolePhotoService,
    getMolePhotoService,
    updateMolePhotoService,
    addAnatomicalSitePhotoService,
    getAnatomicalSitesService,
    patientsService,
    createPatientService,
    updatePatientService,
};
