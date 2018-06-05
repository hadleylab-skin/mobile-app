import { mrnScanerService } from './mrn-scaner';
import { updateDoctorService,
         updateDoctorPhotoService,
         getDoctorService,
         getDoctorKeyListService } from './doctor';
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
         getPatientService,
         createPatientService,
         updatePatientService,
         updatePatientConsentService,
       } from './patients';
import { getSiteJoinRequestsService,
         createSiteJoinRequestService,
         confirmSiteJoinRequestService,
       } from './site-join-requests';
import { getStudiesService,
         addStudyConsentService,
       } from './study';
import { getInvitesService,
         approveInviteService,
         declineInviteService,
       } from './invites';


export default {
    mrnScanerService,
    updateDoctorService,
    updateDoctorPhotoService,
    getDoctorService,
    getDoctorKeyListService,
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
    getPatientService,
    createPatientService,
    updatePatientService,
    updatePatientConsentService,
    getSiteJoinRequestsService,
    createSiteJoinRequestService,
    confirmSiteJoinRequestService,
    getStudiesService,
    addStudyConsentService,
    getInvitesService,
    approveInviteService,
    declineInviteService,
};
