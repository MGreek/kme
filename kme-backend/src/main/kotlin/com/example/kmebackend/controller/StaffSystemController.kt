package com.example.kmebackend.controller

import com.example.kmebackend.model.*
import com.example.kmebackend.model.dto.StaffSystemDTO
import com.example.kmebackend.service.*
import com.example.kmebackend.service.builder.StaffSystemBuilder
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/api/staff-system")
@CrossOrigin(origins = ["http://localhost:1234"])
class StaffSystemController(
    @Autowired
    val staffSystemService: StaffSystemService,
    @Autowired
    val staffService: StaffService,
    @Autowired
    val measureService: MeasureService,
    @Autowired
    val voiceService: VoiceService,
    @Autowired
    val groupingService: GroupingService,
    @Autowired
    val restService: RestService,
    @Autowired
    val chordService: ChordService,
    @Autowired
    val noteService: NoteService,
) {
    @RequestMapping("/sample")
    fun getSampleStaffSystem(): ResponseEntity<StaffSystemDTO> {
        try {
            val staffSystemBuilder =
                StaffSystemBuilder(
                    staffSystemService,
                    staffService,
                    measureService,
                    voiceService,
                    groupingService,
                    restService,
                    chordService,
                    noteService,
                )

            staffSystemBuilder.createAndSelectStaffSystem(StaffSystem())
                .buildStaves()
                .appendAndSelectStaff(Staff())
                .buildMeasures()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Bass,
                        metadata = MeasureMetadata(drawClef = true, drawKeySignature = true, drawTimeSignature = true),
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildChords()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back().back().back()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildChords()
                .appendAndSelectChord(Chord(stem = Stem(StemType.Whole), dotCount = 0))
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back().back().back().back()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Treble,
                        metadata = MeasureMetadata(),
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildRests()
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Whole))
                .back().back().back().back().back()
                .buildStaves()
                .appendAndSelectStaff(Staff())
                .buildMeasures()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Treble,
                        metadata = MeasureMetadata(),
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildChords()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Sixteenth),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.DoubleSharp,
                    ),
                )
                .back().back()
                .buildRests()
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Sixteenth))
                .back()
                .buildChords()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Eight),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.DoubleSharp,
                    ),
                )
                .back().back().back()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildChords()
                .appendAndSelectChord(Chord(stem = Stem(StemType.Whole), dotCount = 0))
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back().back().back().back()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Treble,
                        metadata = MeasureMetadata(),
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildRests()
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))

            val staffSystem = staffSystemService.findById(staffSystemBuilder.getSelectedStaffSystemId()).orElseThrow()
            return ResponseEntity.ok(staffSystemService.staffSystemToDTO(staffSystem))
        } catch (_: Exception) {
            return ResponseEntity.internalServerError().build()
        }
    }
}