import { mrnScanerService } from './mrn-scaner';
import { updateDoctorService } from './doctor';
import { getPatientMolesService,
         addMoleService,
         getMoleService,
         addMolePhotoService,
         getMolePhotoService,
         updateMolePhotoService,
       } from './mole';
import { addAnatomicalSitePhotoService, getAnatomicalSitesService } from './anatomical-site.js';
import { patientsService,
         patientImagesService,
         createPatientService,
         updatePatientService,
       } from './patients';


export default {
    mrnScanerService,
    updateDoctorService,
    getPatientMolesService,
    addMoleService,
    getMoleService,
    addMolePhotoService,
    getMolePhotoService,
    updateMolePhotoService,
    addAnatomicalSitePhotoService,
    getAnatomicalSitesService,
    patientsService,
    patientImagesService,
    createPatientService,
    updatePatientService,
};
