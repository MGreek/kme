package com.example.kmebackend.model

import jakarta.persistence.*
import jakarta.validation.constraints.AssertTrue

@Embeddable
data class GroupingEntryId(
    @Embedded
    val groupingId: GroupingId,
    @Column(name = "grouping_entries_order")
    val groupingEntriesOrder: Long,
)

@Entity
data class GroupingEntry(
    @EmbeddedId
    val groupingEntryId: GroupingEntryId,
    @ManyToOne
    @JoinColumns(
        // all columns from GroupingId
        JoinColumn(name = "staff_system_id", insertable = false, updatable = false),
        JoinColumn(name = "staves_order", insertable = false, updatable = false),
        JoinColumn(name = "measures_order", insertable = false, updatable = false),
        JoinColumn(name = "voices_order", insertable = false, updatable = false),
        JoinColumn(name = "groupings_order", insertable = false, updatable = false),
    )
    val grouping: Grouping,
    @OneToOne(optional = true)
    @JoinColumns(
        // all columns from ChordId
        JoinColumn(name = "staff_system_id", insertable = false, updatable = false),
        JoinColumn(name = "staves_order", insertable = false, updatable = false),
        JoinColumn(name = "measures_order", insertable = false, updatable = false),
        JoinColumn(name = "voices_order", insertable = false, updatable = false),
        JoinColumn(name = "groupings_order", insertable = false, updatable = false),
        JoinColumn(name = "grouping_entries_order", insertable = false, updatable = false),
    )
    val chord: Chord? = null,
    @OneToOne(optional = true)
    @JoinColumns(
        // all columns from RestId
        JoinColumn(name = "staff_system_id", insertable = false, updatable = false),
        JoinColumn(name = "staves_order", insertable = false, updatable = false),
        JoinColumn(name = "measures_order", insertable = false, updatable = false),
        JoinColumn(name = "voices_order", insertable = false, updatable = false),
        JoinColumn(name = "groupings_order", insertable = false, updatable = false),
        JoinColumn(name = "grouping_entries_order", insertable = false, updatable = false),
    )
    val rest: Rest? = null,
    val metadata: String? = null,
) {
    @AssertTrue
    private fun hasEntry() = (chord != null && rest == null) || (chord == null && rest != null)
}
